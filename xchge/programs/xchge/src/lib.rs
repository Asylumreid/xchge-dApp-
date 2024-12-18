use anchor_lang::prelude::*;

declare_id!("EfoXx4qV31vftc8zbridvZ1cc62o5UvmGFk7zfooyCXP");

#[program]
pub mod xchge {
    use super::*;

    pub fn create_listing(
        ctx: Context<CreateListing>,
        amount: u64,
        title: String,
        description: String,
    ) -> Result<()> {
        require!(amount > 0, CustomError::InvalidAmount);
        require!(title.len() > 0, CustomError::EmptyTitle);
        require!(title.len() <= 200, CustomError::TitleTooLong);
        require!(description.len() <= 1000, CustomError::DescriptionTooLong);

        let listing = &mut ctx.accounts.listing;
        let clock = Clock::get()?;

        listing.receiver = ctx.accounts.receiver.key();
        listing.amount = amount;
        listing.title = title;
        listing.description = description;
        listing.status = ListingStatus::Active;
        listing.creation_time = clock.unix_timestamp;
        listing.received_amount = 0;

        Ok(())
    }

    pub fn donate(ctx: Context<Donate>, amount: u64) -> Result<()> {
        let listing = &mut ctx.accounts.listing;
        require!(listing.status == ListingStatus::Active, CustomError::ListingNotActive);
        require!(amount > 0, CustomError::InvalidAmount);
        
        anchor_lang::solana_program::program::invoke(
            &anchor_lang::solana_program::system_instruction::transfer(
                &ctx.accounts.donor.key(),
                &ctx.accounts.receiver.key(),
                amount,
            ),
            &[
                ctx.accounts.donor.to_account_info(),
                ctx.accounts.receiver.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        listing.received_amount = listing.received_amount.checked_add(amount).unwrap();
        
        if listing.received_amount >= listing.amount {
            listing.status = ListingStatus::Completed;
        }

        Ok(())
    }

}

#[derive(Accounts)]
pub struct CreateListing<'info> {
    #[account(
        init,
        payer = receiver,
        space = Listing::LEN,
        seeds = [b"listing", receiver.key().as_ref()],
        bump
    )]
    pub listing: Account<'info, Listing>,
    
    #[account(mut)]
    pub receiver: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Donate<'info> {
    #[account(mut)]
    pub listing: Account<'info, Listing>,
    
    #[account(mut)]
    pub donor: Signer<'info>,
    
    /// CHECK: Receiver address is verified in the listing account
    #[account(mut, address = listing.receiver)]
    pub receiver: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Listing {
    pub receiver: Pubkey,
    pub amount: u64,
    pub received_amount: u64,
    pub title: String,
    pub description: String,
    pub status: ListingStatus,
    pub creation_time: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Debug)]
pub enum ListingStatus {
    Active,
    Completed,
}

#[error_code]
pub enum CustomError {
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Empty title")]
    EmptyTitle,
    #[msg("Title too long")]
    TitleTooLong,
    #[msg("Description too long")]
    DescriptionTooLong,
    #[msg("Listing is not active")]
    ListingNotActive,
}

impl Listing {
    pub const LEN: usize = 8 + // discriminator
        32 + // receiver
        8 + // amount
        8 + // received_amount
        204 + // title (200 chars + 4 for length)
        1004 + // description (1000 chars + 4 for length)
        1 + // status
        8; // creation_time
}