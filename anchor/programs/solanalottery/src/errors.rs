use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Lottery is not Open")]
    LotteryNotOpen,

    #[msg("You are Not Authorized")]
    NotAuthorized,

    #[msg("Randomness Already Revealed")]
    RandomnessAlreadyRevealed,

    #[msg("Incorrect Random Account")]
    IncorrectRandomnessAccount,

    #[msg("Lottery Not Completed ")]
    LotteryNotCompleted,

    #[msg("Winner Chosen")]
    WinnerChosen,

    #[msg("Randomness Not Resolved")]
    RandomnessNotResolved,

    #[msg("Winner Not Chosen")]
    WinnerNotChosen,

    #[msg("Incorrect Ticket")]
    IncorrectTicket,

    #[msg("Not Verified Ticket")]
    NotVerifiedTicket,
}
